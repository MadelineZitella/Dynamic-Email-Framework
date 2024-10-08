import { Injectable } from "@tsed/di";
import { EmailConfig } from "../model/EmailConfig";
import { NotFound } from "@tsed/exceptions";
import nunjucks from "nunjucks";
import config from "../../app.config";
import SESTransport from "nodemailer/lib/ses-transport";
import Mail from "nodemailer/lib/mailer";
import SMTPConnection from "nodemailer/lib/smtp-connection";
import nodemailer, { Transporter } from "nodemailer";
import { ConfigService } from "./ConfigService";

export enum NotificationType {
  TRUE_TARGET_SUPPORT = "true_target_support",
  SEND_TO_SOURCE_FAILURE = "send_to_source_failure",
  NEW_ACTIVATION = "new_activation",
}

@Injectable()
export class NotificationService {
  mockSentMessageInfo: SESTransport.SentMessageInfo = {
    envelope: {
      from: "development@epsilon.com",
      to: ["development@epsilon.com"],
    },
    messageId: "1234567890",
    response: "200 OK",
    accepted: ["development@epsilon.com"],
    rejected: [],
    pending: [],
  };
  transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const { host, auth } = config.smtpConfig;
    const port = Number(config.smtpConfig.port);
    const secure = JSON.parse(config.smtpConfig.secure);
    const smtpOptions: SMTPConnection.Options = { host, port, secure, auth };
    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  /**
   * Function takes in type and gets notification configuration
   *
   * @param {string} type
   * @return {Object} EmailConfig
   * @throws {Error} NotFound
   *
   */
  async getConfigByType(type: string) {
    const emailConfig = await EmailConfig.findOne({
      where: {
        env: this.configService.nodeEnv,
        type: type,
      },
    });

    if (!emailConfig) {
      throw new NotFound("Template not found");
    }

    return emailConfig;
  }

  /**
   * Function takes in type and data, renders the subject, and returns it
   *
   * @param {string} type
   * @param {Object} data
   * @return {string}
   *
   */
  async renderSubject(type: string, data: { [key: string]: any }) {
    const emailConfig = await this.getConfigByType(type);
    return nunjucks.renderString(emailConfig.subject, data);
  }

  /**
   * Function takes in type and data, renders the body, and returns it
   *
   * @param {string} type
   * @param {Object} data
   * @return {string}
   *
   */
  async renderBody(type: string, data: { [key: string]: any }) {
    const emailConfig = await this.getConfigByType(type);
    return nunjucks.renderString(emailConfig.template, data);
  }

  /**
   * Function takes in emailConfig, subject, and body and sends email
   *
   * @param {string} type
   * @param {Object} data
   * @param {string} [filename]
   * @param {string} [content]
   *
   */
  async sendEmailMessage(
    type: string,
    data: { [key: string]: any },
    filename?: string,
    content?: string
  ): Promise {
    const emailConfig = await this.getConfigByType(type);
    const subject = await this.renderSubject(type, data);
    const body = await this.renderBody(type, data);

    const message: Mail.Options = {
      from: emailConfig.from,
      to: emailConfig.to,
      subject: subject,
      html: body,
    };

    if (filename && content) {
      message.attachments = [{ filename, content }];
    }

    if (!this.configService.enableMailer) {
      return this.mockSentMessageInfo;
    } else {
      return this.transporter.sendMail(message);
    }
  }
}

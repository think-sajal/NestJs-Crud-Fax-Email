import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mail } from './entities/mail.entity';
import { Repository } from 'typeorm';
import { SendMailDto, UpdateMailDto } from './dto/mail.dto';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import * as Imap from 'node-imap';
import { simpleParser, ParsedMail, AddressObject } from 'mailparser';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private imap: Imap;
  constructor(
    @InjectRepository(Mail) private readonly mailRepository: Repository<Mail>,
  ) {
    this.transporter = nodemailer.createTransport(
      smtpTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
    );
    this.imap = new Imap({
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST,
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false,
      },
    });

    this.imap.once('ready', () => {
      this.fetchNewEmails();
    });

    this.imap.once('error', (error) => {
      console.error('IMAP Error:', error);
    });

    this.imap.connect();
  }

  async findMails() {
    return this.mailRepository.find({ where: { isSent: false } });
  }

  async deleteMail(id: number) {
    return await this.mailRepository.delete({ id });
  }

  async createMail(mail: SendMailDto) {
    const emailSubject = 'New Mail Created';
    const emailText = `A new mail with the subject "${mail.subject}" has been created.`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'your-email@example.com',
      to: mail.to[0],
      subject: emailSubject,
      text: emailText,
    };
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
    const newMail = new Mail();
    newMail.subject = emailSubject;
    newMail.from = '';
    newMail.to = mail.to[0];
    newMail.body = emailText;
    newMail.isSent = true;
    return this.mailRepository.save(newMail);
  }

  async updateMail(mail: UpdateMailDto) {
    return await this.mailRepository.update(
      { id: mail.id },
      { body: mail.body },
    );
  }

  async saveAttachments(files: any, id: number) {
    const attachments = files.map((val) => val.path);
    return await this.mailRepository.update({ id }, { attachments });
  }

  private fetchNewEmails() {
    this.imap.openBox('INBOX', true, (err, box) => {
      if (err) {
        console.error('Error opening mailbox:', err);
        return;
      }
      this.imap.on('mail', (numNewMsgs) => {
        console.log(`New Email Received`);
        const fetch = this.imap.seq.fetch('*', { bodies: '', struct: true });

        fetch.on('message', (msg) => {
          const emailContent: Buffer[] = [];

          msg.on('body', (stream, info) => {
            let buffer = Buffer.alloc(0);

            stream.on('data', (chunk) => {
              buffer = Buffer.concat([buffer, chunk]);
            });

            stream.on('end', () => {
              emailContent.push(buffer);
            });
          });
          msg.once('end', () => {
            const emailText = Buffer.concat(emailContent).toString('utf8');
            this.parseEmail(emailText);
          });
        });

        fetch.once('end', () => {
          console.log('All messages have been retrieved.');
        });
      });
    });
  }

  async parseEmail(emailText: string, isSent: boolean = false) {
    try {
      const parsedMail: ParsedMail = await simpleParser(emailText);
      const subject = parsedMail.subject || '';
      const from = this.extractEmails(parsedMail.from);
      const to = this.extractEmails(parsedMail.to);
      const cc = this.extractEmails(parsedMail.cc);
      const body = parsedMail.text || '';

      const mail = new Mail();
      mail.subject = subject;
      mail.from = from;
      mail.to = to;
      mail.cc = cc;
      mail.body = body;
      mail.isSent = isSent;

      await this.mailRepository.save(mail);
      
      return { subject, to, from, cc };
    } catch (error) {
      console.error('Error parsing email:', error);
    }
  }

  private extractEmails(
    addresses: AddressObject | AddressObject[] | undefined,
  ): string {
    if (!addresses) {
      return '';
    }
    if (Array.isArray(addresses)) {
      return addresses.map((address) => address.text || '').join(', ');
    } else {
      return addresses.text || '';
    }
  }
}

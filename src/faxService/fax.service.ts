import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendFax } from './entities/sendFax.entity';
import { ReceivedFax } from './entities/receivedFax.entity';
import { SendFaxDto } from './dto/sendFax.dto';
import * as FormData from 'form-data';
import axios from 'axios';
import { SDK } from '@ringcentral/sdk';

@Injectable()
export class FaxService {
  private documoApiKey: string;
  private documoApiUrl: string = 'https://api.documo.com/v1';
  private ringCentral: SDK;
  constructor(
    @InjectRepository(ReceivedFax)
    private readonly receivedFaxRepository: Repository<ReceivedFax>,
    @InjectRepository(SendFax)
    private readonly sentFaxRepository: Repository<SendFax>,
  ) {
    this.documoApiKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkNjRiZjQ2OS02N2ZhLTRhNzEtOTZiNS1mYjY2ZmNkNDU0ZjQiLCJhY2NvdW50SWQiOiI2M2Y1MWJhZi04ZGQ1LTQ5YTQtYjdhYy1hMDhmMmE4Nzc2ZDYiLCJpYXQiOjE2OTQ0MjY1Mjl9.X8v6D-T3UVSCyfqmnKPHSNjGeVzrVeB-Nb5_FlmK9dQ';
    this.ringCentral = new SDK({
      clientId: '6QfNrpNJU3BfHGZfxoRiDY',
      clientSecret: '35Zi35Ljw7cfSgQEhfiA5q5oqCg2g6VQZdEZU1aGtN3i',
      server: 'https://platform.devtest.ringcentral.com',
    });
  }
  async sendFax(sendFaxDto: SendFaxDto): Promise<void> {
    const platform = this.ringCentral.platform();
    platform.login({
      jwt: 'eyJraWQiOiI4NzYyZjU5OGQwNTk0NGRiODZiZjVjYTk3ODA0NzYwOCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJodHRwczovL3BsYXRmb3JtLmRldnRlc3QucmluZ2NlbnRyYWwuY29tL3Jlc3RhcGkvb2F1dGgvdG9rZW4iLCJzdWIiOiI4MTc0MzIwMDUiLCJpc3MiOiJodHRwczovL3BsYXRmb3JtLmRldnRlc3QucmluZ2NlbnRyYWwuY29tIiwiZXhwIjoxNzAxMzg4Nzk5LCJpYXQiOjE2OTQ0NDA0NzgsImp0aSI6IjR1aXhjVTZuUTl5N3o0YWJ1eWhGUXcifQ.Vz4fH2GUyaVm944W5iFU7Ux0RT0eXI2o_Vs0lJLV7YJoNr4dwnnCsTrPOzVDN_dE2PitkxW7oLe0lvK5IPttcLswKhm5dkq9_qpygOLCUlkHi25v2gQ3Nqmp_RLYdWmSn-OWFU2RkFIjgcPoVCH1ixmKLLA-l5aLyb9enn_Cyod_DnnAeisJgd9g5z-H0AbBhkMBSjCLuhma7Rjc5iO6oDY8rLC8pPEixl8WHHJBtMspQzoGyKHvZ-7yAkvt_EvEZoXSCeMNNCmyjC8lQGcE6_GynYj6UvcxYTPbtWIC9SUYbdh60ENhtCJ1--DuQ9fvahPJoGo7d3XFFC6_Xl-sGA',
    });
    platform.on(platform.events.loginSuccess, async (e) => {
      await this.ringCentralFunction(sendFaxDto);
    }); // Ring central

    const formData = new FormData();
    formData.append('faxNumber', sendFaxDto.to);
    formData.append('attachments', sendFaxDto.mediaUrl);
    const headers = {
      Authorization: `Basic ${this.documoApiKey}`,
    };

    try {
      const response = await axios.post(
        `${this.documoApiUrl}/faxes`,
        formData,
        {
          headers,
          maxRedirects: 0,
        },
      );

      if (response && response.status === 200) {
        const sentFax = new SendFax();
        sentFax.to = sendFaxDto.to;
        sentFax.from = sendFaxDto.from;
        sentFax.dateSent = new Date();
        sentFax.mediaUrl = sendFaxDto.mediaUrl;
        await this.sentFaxRepository.save(sentFax);
      } else {
        console.error('Error sending fax:', response);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error(
          'Unauthorized: Please check your API key and permissions.',
        );
      } else {
        console.error('Error sending fax:', error.message);
      }
    }
  }

  async ringCentralFunction(sendFaxDto: any) {
    try {
      const formData = new FormData();
      const bodyParams = {
        to: [{ phoneNumber: sendFaxDto }],
      };

      formData.append('json', JSON.stringify(bodyParams), {
        filename: 'request.json',
        contentType: 'application/json',
      });

      const endpoint = '/restapi/v1.0/account/~/extension/~/fax';
      const resp = await this.ringCentral.post(endpoint, formData);

      const resId = await resp.json();
      console.log('FAX sent. Message id:', resId.id);

      try {
        const endpoint = `/restapi/v1.0/account/~/extension/~/message-store/${resId.id}`;
        const resp = await this.ringCentral.get(endpoint);
        const jsonObj = await resp.json();

        console.log('Message status:', jsonObj.messageStatus);

        if (jsonObj.messageStatus === 'Queued') {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (e) {
        console.error(e.message);
      }
    } catch (e) {
      console.error(e.message);
    }
  }

  async listReceivedFaxes(): Promise<ReceivedFax[]> {
    const headers = {
      Authorization: `Basic ${this.documoApiKey}`,
    };
    const response = await axios.get('https://api.documo.com/api-keys', {
      headers,
    });

    const platform = this.ringCentral.platform();
    platform.login({
      jwt: 'eyJraWQiOiI4NzYyZjU5OGQwNTk0NGRiODZiZjVjYTk3ODA0NzYwOCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJodHRwczovL3BsYXRmb3JtLmRldnRlc3QucmluZ2NlbnRyYWwuY29tL3Jlc3RhcGkvb2F1dGgvdG9rZW4iLCJzdWIiOiI4MTc0MzIwMDUiLCJpc3MiOiJodHRwczovL3BsYXRmb3JtLmRldnRlc3QucmluZ2NlbnRyYWwuY29tIiwiZXhwIjoxNzAxMzg4Nzk5LCJpYXQiOjE2OTQ0NDA0NzgsImp0aSI6IjR1aXhjVTZuUTl5N3o0YWJ1eWhGUXcifQ.Vz4fH2GUyaVm944W5iFU7Ux0RT0eXI2o_Vs0lJLV7YJoNr4dwnnCsTrPOzVDN_dE2PitkxW7oLe0lvK5IPttcLswKhm5dkq9_qpygOLCUlkHi25v2gQ3Nqmp_RLYdWmSn-OWFU2RkFIjgcPoVCH1ixmKLLA-l5aLyb9enn_Cyod_DnnAeisJgd9g5z-H0AbBhkMBSjCLuhma7Rjc5iO6oDY8rLC8pPEixl8WHHJBtMspQzoGyKHvZ-7yAkvt_EvEZoXSCeMNNCmyjC8lQGcE6_GynYj6UvcxYTPbtWIC9SUYbdh60ENhtCJ1--DuQ9fvahPJoGo7d3XFFC6_Xl-sGA',
    });
    platform.on(platform.events.loginSuccess, async (e) => {
      const messageReceived = await this.ringCentral.get(
        '/restapi/v1.0/account/~/extension/~/message-store?direction=Inbound&messageType=Fax',
      );
    });
    console.log(response.data);
    return this.receivedFaxRepository.find();
  }
}

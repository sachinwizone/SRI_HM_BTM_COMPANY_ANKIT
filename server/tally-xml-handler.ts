import { Request, Response } from 'express';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { db } from './db';
import { tallyCompanies, tallyLedgers, tallyStockItems, tallyVouchers, tallySyncLogs } from '../shared/schema';
import { eq } from 'drizzle-orm';

export class TallyXMLHandler {
  private xmlParser: XMLParser;
  private xmlBuilder: XMLBuilder;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true
    });

    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      textNodeName: '#text',
      format: true,
      suppressEmptyNode: true
    });
  }

  // Main handler for all Tally XML requests
  async handleXMLRequest(req: Request, res: Response) {
    try {
      console.log('Received Tally XML request:', req.body);
      
      let xmlData: string;
      if (typeof req.body === 'string') {
        xmlData = req.body;
      } else {
        xmlData = req.body.toString();
      }

      if (!xmlData || xmlData.trim() === '') {
        return this.sendErrorResponse(res, 'Empty XML request body');
      }

      // Parse the XML request
      const parsedXML = this.xmlParser.parse(xmlData);
      
      // Determine the request type and handle accordingly
      const responseXML = await this.processXMLRequest(parsedXML);
      
      // Set proper headers for Tally
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      res.status(200).send(responseXML);

    } catch (error: any) {
      console.error('Error processing Tally XML request:', error);
      this.sendErrorResponse(res, error.message);
    }
  }

  private async processXMLRequest(parsedXML: any): Promise<string> {
    try {
      // Check if this is a company info request
      if (parsedXML.ENVELOPE && parsedXML.ENVELOPE.HEADER) {
        const header = parsedXML.ENVELOPE.HEADER;
        
        if (header.TYPE === 'Data' && header.ID === 'GetCompanyInfo') {
          return this.handleCompanyInfoRequest();
        }
        
        if (header.TYPE === 'Import' && header.ID === 'ImportData') {
          return await this.handleDataImport(parsedXML.ENVELOPE.BODY);
        }
        
        if (header.TYPE === 'Export' && header.ID === 'ExportData') {
          return await this.handleDataExport(parsedXML.ENVELOPE.BODY);
        }
      }

      // Handle TDL requests
      if (parsedXML.TDL || (parsedXML.ENVELOPE && parsedXML.ENVELOPE.TDL)) {
        return this.handleTDLRequest();
      }

      // Handle ledger/voucher data requests
      if (parsedXML.TALLYMESSAGE) {
        return await this.handleTallyMessage(parsedXML.TALLYMESSAGE);
      }

      // Default response for unhandled requests
      return this.createSuccessResponse('Request acknowledged');

    } catch (error: any) {
      console.error('Error processing XML request:', error);
      throw new Error(`XML processing failed: ${error.message}`);
    }
  }

  private handleCompanyInfoRequest(): string {
    const response = {
      ENVELOPE: {
        HEADER: {
          VERSION: '1',
          TALLYREQUEST: 'Export',
          TYPE: 'Data',
          ID: 'CompanyInfo'
        },
        BODY: {
          DESC: {
            STATICVARIABLES: {
              SVEXPORTFORMAT: '$$SysName:XML'
            }
          },
          DATA: {
            TALLYMESSAGE: {
              COMPANY: {
                '@NAME': 'TallySync Integration Server',
                '@REMOTECMPINFO.LIST': {
                  REMOTECMPINFO: {
                    '@NAME': 'TallySync Server',
                    REMOTECMPNAME: 'TallySync Integration',
                    REMOTECMPSTATE: 'Active',
                    REMOTECMPGUID: 'tallysync-server-guid-001'
                  }
                }
              }
            }
          }
        }
      }
    };

    return this.xmlBuilder.build(response);
  }

  private async handleDataImport(body: any): Promise<string> {
    try {
      console.log('Handling data import:', JSON.stringify(body, null, 2));
      
      // Log the sync operation
      await db.insert(tallySyncLogs).values({
        entity: 'tally-import',
        operation: 'DATA_IMPORT',
        status: 'SUCCESS',
        dataType: 'MIXED',
        totalReceived: 1,
        details: JSON.stringify(body)
      });

      return this.createSuccessResponse('Data imported successfully');
    } catch (error: any) {
      console.error('Data import error:', error);
      await this.logSyncError('tally-import', 'DATA_IMPORT', error.message);
      throw error;
    }
  }

  private async handleDataExport(body: any): Promise<string> {
    try {
      console.log('Handling data export request:', JSON.stringify(body, null, 2));
      
      // Get companies from database
      const companies = await db.select().from(tallyCompanies);
      
      const response = {
        ENVELOPE: {
          HEADER: {
            VERSION: '1',
            TALLYREQUEST: 'Export',
            TYPE: 'Data',
            ID: 'ExportData'
          },
          BODY: {
            DESC: {
              STATICVARIABLES: {
                SVEXPORTFORMAT: '$$SysName:XML'
              }
            },
            DATA: {
              TALLYMESSAGE: {
                '@xmlns:UDF': 'TallyUDF',
                COMPANY: companies.map(company => ({
                  '@NAME': company.name,
                  '@REMOTECMPINFO.LIST': {
                    REMOTECMPINFO: {
                      '@NAME': company.name,
                      REMOTECMPNAME: company.name,
                      REMOTECMPSTATE: 'Active',
                      REMOTECMPGUID: company.externalId,
                      APIKEY: company.apiKey
                    }
                  }
                }))
              }
            }
          }
        }
      };

      await this.logSyncOperation('tally-export', 'DATA_EXPORT', 'SUCCESS', companies.length);
      return this.xmlBuilder.build(response);

    } catch (error: any) {
      console.error('Data export error:', error);
      await this.logSyncError('tally-export', 'DATA_EXPORT', error.message);
      throw error;
    }
  }

  private handleTDLRequest(): string {
    // TDL (Tally Definition Language) response
    const tdlResponse = {
      TDL: {
        TDLMESSAGE: {
          REPORT: {
            '@NAME': 'TallySyncReport',
            FORM: {
              '@NAME': 'TallySyncForm',
              PARTS: {
                PART: {
                  '@NAME': 'TallySyncPart',
                  TOPPARTS: 'TallySyncPart',
                  LINES: {
                    LINE: {
                      '@NAME': 'TallySyncLine',
                      FIELDS: 'TallySyncField'
                    }
                  }
                }
              }
            },
            FIELD: {
              '@NAME': 'TallySyncField',
              '@SET': '"TallySync Integration Active"'
            }
          }
        }
      }
    };

    return this.xmlBuilder.build(tdlResponse);
  }

  private async handleTallyMessage(tallyMessage: any): Promise<string> {
    try {
      console.log('Processing TallyMessage:', JSON.stringify(tallyMessage, null, 2));

      // Handle different types of Tally messages
      if (tallyMessage.LEDGER) {
        return await this.handleLedgerData(tallyMessage.LEDGER);
      }

      if (tallyMessage.VOUCHER) {
        return await this.handleVoucherData(tallyMessage.VOUCHER);
      }

      if (tallyMessage.STOCKITEM) {
        return await this.handleStockItemData(tallyMessage.STOCKITEM);
      }

      // Default response for other message types
      return this.createSuccessResponse('TallyMessage processed');

    } catch (error: any) {
      console.error('TallyMessage processing error:', error);
      throw error;
    }
  }

  private async handleLedgerData(ledgerData: any): Promise<string> {
    try {
      // Process ledger data and save to database
      const ledgers = Array.isArray(ledgerData) ? ledgerData : [ledgerData];
      
      for (const ledger of ledgers) {
        await db.insert(tallyLedgers).values({
          name: ledger['@NAME'] || ledger.NAME || 'Unknown Ledger',
          group: ledger.PARENT || 'Primary',
          openingBalance: parseFloat(ledger.OPENINGBALANCE || '0'),
          closingBalance: parseFloat(ledger.CLOSINGBALANCE || '0'),
          externalId: ledger['@NAME'] || `ledger_${Date.now()}`
        });
      }

      await this.logSyncOperation('default-company', 'LEDGER_SYNC', 'SUCCESS', ledgers.length);
      return this.createSuccessResponse(`${ledgers.length} ledger(s) processed successfully`);

    } catch (error: any) {
      await this.logSyncError('default-company', 'LEDGER_SYNC', error.message);
      throw error;
    }
  }

  private async handleVoucherData(voucherData: any): Promise<string> {
    try {
      const vouchers = Array.isArray(voucherData) ? voucherData : [voucherData];
      
      for (const voucher of vouchers) {
        await db.insert(tallyVouchers).values({
          voucherType: voucher.VOUCHERTYPE || 'Journal',
          voucherNumber: voucher.VOUCHERNUMBER || `V${Date.now()}`,
          date: new Date(voucher.DATE || Date.now()),
          amount: voucher.AMOUNT ? parseFloat(voucher.AMOUNT).toString() : '0',
          narration: voucher.NARRATION || '',
          externalId: voucher['@NAME'] || `voucher_${Date.now()}`
        });
      }

      await this.logSyncOperation('default-company', 'VOUCHER_SYNC', 'SUCCESS', vouchers.length);
      return this.createSuccessResponse(`${vouchers.length} voucher(s) processed successfully`);

    } catch (error: any) {
      await this.logSyncError('default-company', 'VOUCHER_SYNC', error.message);
      throw error;
    }
  }

  private async handleStockItemData(stockItemData: any): Promise<string> {
    try {
      const stockItems = Array.isArray(stockItemData) ? stockItemData : [stockItemData];
      
      for (const stockItem of stockItems) {
        await db.insert(tallyStockItems).values({
          name: stockItem['@NAME'] || stockItem.NAME || 'Unknown Item',
          group: stockItem.PARENT || 'Primary',
          unit: stockItem.BASEUNITS || 'Nos',
          openingQuantity: stockItem.OPENINGBALANCE || '0',
          closingQuantity: stockItem.CLOSINGBALANCE || '0',
          externalId: stockItem['@NAME'] || `item_${Date.now()}`
        });
      }

      await this.logSyncOperation('default-company', 'STOCK_SYNC', 'SUCCESS', stockItems.length);
      return this.createSuccessResponse(`${stockItems.length} stock item(s) processed successfully`);

    } catch (error: any) {
      await this.logSyncError('default-company', 'STOCK_SYNC', error.message);
      throw error;
    }
  }

  private createSuccessResponse(message: string): string {
    const response = {
      ENVELOPE: {
        HEADER: {
          VERSION: '1',
          TALLYREQUEST: 'Import',
          TYPE: 'Data',
          ID: 'ImportResponse'
        },
        BODY: {
          DESC: {
            STATICVARIABLES: {
              SVEXPORTFORMAT: '$$SysName:XML'
            }
          },
          DATA: {
            TALLYMESSAGE: {
              '@xmlns:UDF': 'TallyUDF',
              LINEERROR: {
                '@ERRORCODE': '0',
                '@DESCRIPTION': message,
                '@STATUS': 'Success'
              }
            }
          }
        }
      }
    };

    return this.xmlBuilder.build(response);
  }

  private sendErrorResponse(res: Response, errorMessage: string) {
    const errorResponse = {
      ENVELOPE: {
        HEADER: {
          VERSION: '1',
          TALLYREQUEST: 'Import',
          TYPE: 'Data',
          ID: 'ErrorResponse'
        },
        BODY: {
          DATA: {
            TALLYMESSAGE: {
              LINEERROR: {
                '@ERRORCODE': '1',
                '@DESCRIPTION': errorMessage,
                '@STATUS': 'Error'
              }
            }
          }
        }
      }
    };

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(400).send(this.xmlBuilder.build(errorResponse));
  }

  private async logSyncOperation(companyId: string, operation: string, status: string, recordCount: number) {
    try {
      await db.insert(tallySyncLogs).values({
        entity: companyId,
        operation,
        status,
        dataType: operation.split('_')[0], // Extract data type from operation
        totalReceived: recordCount,
        details: `${operation} completed with ${recordCount} records`
      });
    } catch (error) {
      console.error('Failed to log sync operation:', error);
    }
  }

  private async logSyncError(companyId: string, operation: string, errorMessage: string) {
    try {
      await db.insert(tallySyncLogs).values({
        entity: companyId,
        operation,
        status: 'ERROR',
        dataType: operation.split('_')[0],
        totalReceived: 0,
        details: errorMessage
      });
    } catch (error) {
      console.error('Failed to log sync error:', error);
    }
  }
}
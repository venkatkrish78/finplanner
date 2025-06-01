
// Transaction parser based on research findings for Indian banks and UPI platforms

export interface ParsedTransaction {
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  description?: string;
  merchant?: string;
  accountNumber?: string;
  transactionId?: string;
  date: Date;
  balance?: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  platform?: string;
}

export class TransactionParser {
  private patterns = {
    // Universal amount pattern for Indian banks
    amount: /(?:Rs\.?\s*|INR\s*|₹\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    
    // Transaction type patterns
    transactionType: /(debited|credited|transferred|paid|received)/i,
    
    // Account number patterns
    account: /(?:A\/c|account|card).*?(?:ending|no\.?)\s*(?:XX)?(\d{4,6})/i,
    
    // Date/time patterns
    dateTime: [
      /(\d{2}-\d{2}-\d{2,4})\s+(\d{2}:\d{2}(?::\d{2})?)/,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/
    ],
    
    // Transaction ID patterns
    transactionId: /(?:Txn\s*ID|Transaction\s*ID|Ref\s*No|UPI\s*Ref):\s*([A-Z0-9]+)/i,
    
    // Balance patterns
    balance: /(?:Avl\s*Bal|Available\s*Balance|Balance)[-:\s]*(?:Rs\.?\s*|INR\s*|₹\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    
    // Bank/Platform identifiers
    platform: /^(SBI|HDFC|ICICI|Axis|PhonePe|Paytm|GPay|Amazon\s*Pay|BHIM|UPI)/i,
    
    // Status patterns
    status: /Status:\s*(Success|Failed|Pending)/i,
    
    // Merchant patterns
    merchant: /(?:at|from|to)\s+([A-Z\s]+?)(?:\s+on|\s+Txn|\s+UPI|\.)/i
  };

  private bankSpecificPatterns = {
    SBI: {
      amount: /INR\s*(\d+(?:\.\d{2})?)/i,
      account: /A\/c no\.\s*XX(\d{4})/i,
      balance: /Avl Bal-\s*INR\s*(\d+(?:\.\d{2})?)/i
    },
    HDFC: {
      amount: /Rs\.\s*(\d+(?:\.\d{2})?)/i,
      account: /A\/c ending\s*(\d{4})/i
    },
    ICICI: {
      account: /(\d{6})$/i // Last 6 digits pattern
    },
    UPI: {
      amount: /Rs\.\s*(\d+(?:\.\d{2})?)/i,
      account: /(?:account|A\/c) ending\s*(\d{4})/i
    }
  };

  parse(messageText: string): ParsedTransaction | null {
    try {
      const cleanText = messageText.trim();
      
      // Identify platform/bank
      const platform = this.identifyPlatform(cleanText);
      
      // Extract amount
      const amount = this.extractAmount(cleanText, platform);
      if (!amount) return null;
      
      // Extract transaction type
      const type = this.extractTransactionType(cleanText);
      
      // Extract other fields
      const accountNumber = this.extractAccountNumber(cleanText, platform);
      const transactionId = this.extractTransactionId(cleanText);
      const date = this.extractDate(cleanText);
      const balance = this.extractBalance(cleanText, platform);
      const status = this.extractStatus(cleanText);
      const merchant = this.extractMerchant(cleanText);
      
      return {
        amount,
        type,
        description: this.generateDescription(cleanText, merchant, platform),
        merchant,
        accountNumber,
        transactionId,
        date: date || new Date(),
        balance,
        status: status || 'SUCCESS',
        platform
      };
    } catch (error) {
      console.error('Error parsing transaction:', error);
      return null;
    }
  }

  private identifyPlatform(text: string): string | undefined {
    const match = text.match(this.patterns.platform);
    return match ? match[1].trim() : undefined;
  }

  private extractAmount(text: string, platform?: string): number | null {
    // Try platform-specific pattern first
    if (platform && this.bankSpecificPatterns[platform as keyof typeof this.bankSpecificPatterns]) {
      const bankPattern = this.bankSpecificPatterns[platform as keyof typeof this.bankSpecificPatterns];
      if ('amount' in bankPattern && bankPattern.amount) {
        const match = text.match(bankPattern.amount);
        if (match) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }
    
    // Fall back to universal pattern
    const match = text.match(this.patterns.amount);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    
    return null;
  }

  private extractTransactionType(text: string): 'INCOME' | 'EXPENSE' | 'TRANSFER' {
    const match = text.match(this.patterns.transactionType);
    if (match) {
      const type = match[1].toLowerCase();
      if (type === 'credited' || type === 'received') {
        return 'INCOME';
      } else if (type === 'debited' || type === 'paid') {
        return 'EXPENSE';
      } else if (type === 'transferred') {
        return 'TRANSFER';
      }
    }
    
    // Default to expense for most transaction alerts
    return 'EXPENSE';
  }

  private extractAccountNumber(text: string, platform?: string): string | undefined {
    // Try platform-specific pattern first
    if (platform && this.bankSpecificPatterns[platform as keyof typeof this.bankSpecificPatterns]) {
      const bankPattern = this.bankSpecificPatterns[platform as keyof typeof this.bankSpecificPatterns];
      if ('account' in bankPattern && bankPattern.account) {
        const match = text.match(bankPattern.account);
        if (match) {
          return match[1];
        }
      }
    }
    
    // Fall back to universal pattern
    const match = text.match(this.patterns.account);
    return match ? match[1] : undefined;
  }

  private extractTransactionId(text: string): string | undefined {
    const match = text.match(this.patterns.transactionId);
    return match ? match[1] : undefined;
  }

  private extractDate(text: string): Date | null {
    for (const pattern of this.patterns.dateTime) {
      const match = text.match(pattern);
      if (match) {
        try {
          if (match[2]) {
            // Date and time format
            const dateStr = match[1];
            const timeStr = match[2];
            const [day, month, year] = dateStr.split('-').map(Number);
            const [hour, minute, second = 0] = timeStr.split(':').map(Number);
            
            // Handle 2-digit years
            const fullYear = year < 100 ? 2000 + year : year;
            
            return new Date(fullYear, month - 1, day, hour, minute, second);
          } else {
            // Date only format
            return new Date(match[1]);
          }
        } catch (error) {
          continue;
        }
      }
    }
    return null;
  }

  private extractBalance(text: string, platform?: string): number | undefined {
    // Try platform-specific pattern first
    if (platform && this.bankSpecificPatterns[platform as keyof typeof this.bankSpecificPatterns]) {
      const bankPattern = this.bankSpecificPatterns[platform as keyof typeof this.bankSpecificPatterns];
      if ('balance' in bankPattern && bankPattern.balance) {
        const match = text.match(bankPattern.balance);
        if (match) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }
    
    // Fall back to universal pattern
    const match = text.match(this.patterns.balance);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    
    return undefined;
  }

  private extractStatus(text: string): 'SUCCESS' | 'FAILED' | 'PENDING' | undefined {
    const match = text.match(this.patterns.status);
    if (match) {
      const status = match[1].toLowerCase();
      if (status === 'success') return 'SUCCESS';
      if (status === 'failed') return 'FAILED';
      if (status === 'pending') return 'PENDING';
    }
    return undefined;
  }

  private extractMerchant(text: string): string | undefined {
    const match = text.match(this.patterns.merchant);
    return match ? match[1].trim() : undefined;
  }

  private generateDescription(text: string, merchant?: string, platform?: string): string {
    if (merchant) {
      return `Payment to ${merchant}`;
    }
    
    if (platform) {
      return `${platform} transaction`;
    }
    
    // Extract a meaningful description from the text
    const words = text.split(' ').slice(0, 10);
    return words.join(' ') + (text.split(' ').length > 10 ? '...' : '');
  }
}

// Export singleton instance
export const transactionParser = new TransactionParser();

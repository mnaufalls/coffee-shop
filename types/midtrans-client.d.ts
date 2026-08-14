declare module "midtrans-client" {
  type MidtransConfig = {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  };

  type TransactionDetails = {
    order_id: string;
    gross_amount: number;
  };

  type ItemDetail = {
    id: string;
    price: number;
    quantity: number;
    name: string;
  };

  type CustomerDetails = {
    first_name?: string;
    email?: string;
    phone?: string;
  };

  type SnapParameter = {
    transaction_details: TransactionDetails;
    item_details?: ItemDetail[];
    customer_details?: CustomerDetails;
  };

  type SnapTransactionResponse = {
    token: string;
    redirect_url: string;
  };

  class Snap {
    constructor(config: MidtransConfig);

    createTransaction(
      parameter: SnapParameter,
    ): Promise<SnapTransactionResponse>;

    createTransactionToken(
      parameter: SnapParameter,
    ): Promise<string>;

    createTransactionRedirectUrl(
      parameter: SnapParameter,
    ): Promise<string>;

    transaction: {
      notification(
        notification: unknown,
      ): Promise<unknown>;
    };
  }

  const midtransClient: {
    Snap: typeof Snap;
  };

  export default midtransClient;
}
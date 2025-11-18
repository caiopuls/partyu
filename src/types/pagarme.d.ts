/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "pagarme" {
  interface PagarmeClient {
    transactions: {
      create(data: any): Promise<any>;
      find(params: { id: string }): Promise<any>;
    };
  }

  interface Pagarme {
    client: {
      connect(params: { api_key: string }): Promise<PagarmeClient>;
    };
  }

  const pagarme: Pagarme;
  export default pagarme;
}



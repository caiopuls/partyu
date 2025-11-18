import pagarme from "pagarme";

const PAGARME_API_KEY = process.env.PAGARME_API_KEY!;

export interface CreatePixPaymentParams {
  amount: number; // em centavos
  customer: {
    name: string;
    email: string;
    document: string; // CPF ou CNPJ
    phone?: string;
  };
  metadata?: Record<string, unknown>;
  splitRules?: Array<{
    recipient_id: string;
    amount: number; // em centavos
    liable?: boolean;
    charge_processing_fee?: boolean;
  }>;
}

export interface PixPaymentResponse {
  id: string;
  status: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  amount: number;
}

export async function createPixPayment(
  params: CreatePixPaymentParams,
): Promise<PixPaymentResponse> {
  try {
    const client = await pagarme.client.connect({ api_key: PAGARME_API_KEY });

    const transaction = await client.transactions.create({
      amount: params.amount,
      payment_method: "pix",
      // Regras de split opcionais
      ...(params.splitRules && params.splitRules.length > 0
        ? { split_rules: params.splitRules.map((r) => ({
            recipient_id: r.recipient_id,
            amount: r.amount,
            liable: r.liable ?? false,
            charge_processing_fee: r.charge_processing_fee ?? false,
          })) }
        : {}),
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        documents: [
          {
            type: params.customer.document.length === 11 ? "cpf" : "cnpj",
            number: params.customer.document.replace(/\D/g, ""),
          },
        ],
        phone_numbers: params.customer.phone
          ? [params.customer.phone.replace(/\D/g, "")]
          : [],
      },
      metadata: params.metadata || {},
    });

    return {
      id: transaction.id.toString(),
      status: transaction.status,
      pix_qr_code: transaction.pix_qr_code,
      pix_copy_paste: transaction.pix_copy_paste,
      amount: transaction.amount,
    };
  } catch (error) {
    const err = error as { response?: { body?: { message?: string } } };
    console.error("Error creating PIX payment:", error);
    throw new Error(
      err.response?.body?.message || "Erro ao criar pagamento PIX",
    );
  }
}

export async function getTransactionStatus(
  transactionId: string,
): Promise<{ status: string; paid_at?: string }> {
  try {
    const client = await pagarme.client.connect({ api_key: PAGARME_API_KEY });

    const transaction = await client.transactions.find({
      id: transactionId,
    });

    return {
      status: transaction.status,
      paid_at: transaction.paid_at,
    };
  } catch (error) {
    console.error("Error getting transaction status:", error);
    throw new Error("Erro ao consultar status da transação");
  }
}



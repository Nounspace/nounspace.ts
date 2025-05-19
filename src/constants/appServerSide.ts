import { mnemonicToAccount } from "viem/accounts";

export const AppSigner = mnemonicToAccount(process.env.APP_MNEMONIC!);

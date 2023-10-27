export class UserType {
  accountData: {
    id: string;
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
    sentEmail: string[];
  };
  registrationData: {
    ip: string | null;
    userAgent: string;
  };
}

export interface IActivationToken {
  token: string;
  activationCode: string;
}

export interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

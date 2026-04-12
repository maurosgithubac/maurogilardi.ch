/** Client + server action shared form state (cannot live in `"use server"` files). */

export type NewsletterFormState = {
  message: string;
  error: string;
};

export const initialNewsletterFormState: NewsletterFormState = {
  message: "",
  error: "",
};

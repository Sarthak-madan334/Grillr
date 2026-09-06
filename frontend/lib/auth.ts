export type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSignupValues(
  values: SignupFormValues,
): SignupFormValues {
  return {
    firstName: values.firstName.trim().replace(/\s+/g, " "),
    lastName: values.lastName.trim().replace(/\s+/g, " "),
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
}

export function validateSignupForm(values: SignupFormValues): SignupFormErrors {
  const normalized = normalizeSignupValues(values);
  const errors: SignupFormErrors = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  };
  if (!normalized.firstName) errors.firstName = "First name is required.";
  if (!normalized.lastName) errors.lastName = "Last name is required.";
  if (!normalized.email) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(normalized.email))
    errors.email = "Enter a valid email address.";
  if (!normalized.password || normalized.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  return errors;
}

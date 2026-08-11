export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
export const isPhone = (value: string) => /^[0-9+\-\s]{8,15}$/.test(value.trim());
export const isStrongEnough = (value: string) => value.length >= 6;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function validateRegister(form: RegisterForm): FieldErrors<RegisterForm> {
  const errors: FieldErrors<RegisterForm> = {};
  if (form.name.trim().length < 2) errors.name = "Please enter your full name";
  if (!isEmail(form.email)) errors.email = "Enter a valid email address";
  if (!isPhone(form.phone)) errors.phone = "Enter a valid phone number";
  if (!isStrongEnough(form.password)) errors.password = "Minimum 6 characters";
  if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

export interface LoginForm {
  email: string;
  password: string;
}

export function validateLogin(form: LoginForm): FieldErrors<LoginForm> {
  const errors: FieldErrors<LoginForm> = {};
  if (!isEmail(form.email)) errors.email = "Enter a valid email address";
  if (!form.password) errors.password = "Password is required";
  return errors;
}

export interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export function validateCheckout(form: CheckoutForm): FieldErrors<CheckoutForm> {
  const errors: FieldErrors<CheckoutForm> = {};
  if (form.name.trim().length < 2) errors.name = "Name is required";
  if (!isPhone(form.phone)) errors.phone = "Enter a valid phone number";
  if (!isEmail(form.email)) errors.email = "Enter a valid email address";
  if (form.address.trim().length < 10) errors.address = "Please add a complete delivery address";
  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

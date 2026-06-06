import PasswordField from "./PasswordField";

type PasswordFieldKey = "confirmPassword" | "password";

type PasswordConfirmationFieldsProps = {
  confirmPassword: string;
  disabled?: boolean;
  onChange: (key: PasswordFieldKey, value: string) => void;
  password: string;
};

export default function PasswordConfirmationFields({
  confirmPassword,
  disabled,
  onChange,
  password,
}: PasswordConfirmationFieldsProps) {
  return (
    <>
      <PasswordField
        label="Password"
        value={password}
        onChange={(value) => onChange("password", value)}
        autoComplete="new-password"
        disabled={disabled}
      />
      <PasswordField
        label="Confirm Password"
        value={confirmPassword}
        onChange={(value) => onChange("confirmPassword", value)}
        placeholder="Confirm your password"
        autoComplete="new-password"
        disabled={disabled}
      />
    </>
  );
}

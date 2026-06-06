import TextField from "./TextField";

type NameFieldKey = "firstName" | "lastName";

type NameFieldsProps = {
  disabled?: boolean;
  firstName: string;
  lastName: string;
  onChange: (key: NameFieldKey, value: string) => void;
};

export default function NameFields({
  disabled,
  firstName,
  lastName,
  onChange,
}: NameFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label="First Name"
        icon="user"
        name="given-name"
        placeholder="ammar"
        value={firstName}
        onChange={(value) => onChange("firstName", value)}
        autoComplete="given-name"
        disabled={disabled}
      />
      <TextField
        label="Last Name"
        icon="user"
        name="family-name"
        placeholder="yasser"
        value={lastName}
        onChange={(value) => onChange("lastName", value)}
        autoComplete="family-name"
        disabled={disabled}
      />
    </div>
  );
}

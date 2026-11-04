//
// Single source of truth for the client-side password rule, used by every form
// where a user chooses their own password (self-registration, reset via email
// link, and self-service password change). The backend enforces the same rule
// in config/passwordPolicy.js.
//
// Rule: at least 8 characters, including at least one letter, one number, and
// one symbol (any non-alphanumeric character).

// Apply the rule to a Yup string schema:
//   password: passwordRules(Yup.string()).required('Password is required')
export const passwordRules = (schema) =>
  schema
    .min(8, 'At least 8 characters')
    .matches(/[A-Za-z]/, 'Include at least one letter')
    .matches(/\d/, 'Include at least one number')
    .matches(/[^A-Za-z0-9]/, 'Include at least one symbol')

// Short helper text for inputs.
export const PASSWORD_HELP =
  'At least 8 characters, including a letter, a number and a symbol.'

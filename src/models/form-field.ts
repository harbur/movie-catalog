type FormField = {
  label: string
  name: string
  description: string
  type: 'string' | 'number' | 'checkbox'
  visible?: string[]
};

export { type FormField };
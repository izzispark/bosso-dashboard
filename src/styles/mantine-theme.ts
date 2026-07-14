import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'green',
  fontFamily: "'DM Sans', sans-serif",
  defaultRadius: 'md',
  colors: {
    green: [
      '#f1f8e8', '#dff1bd', '#c4e68e', '#a6e35b',
      '#75bb46', '#398354', '#2e7d59', '#245e48',
      '#173121', '#10251b',
    ],
  },
  components: {
    Button:      { defaultProps: { size: 'sm', radius: 'md' } },
    NavLink:     { defaultProps: { variant: 'light', radius: 'md' } },
    TextInput:   { defaultProps: { size: 'sm', radius: 'md' } },
    NumberInput: { defaultProps: { size: 'sm', radius: 'md' } },
    Select:      { defaultProps: { size: 'sm', radius: 'md' } },
  },
})

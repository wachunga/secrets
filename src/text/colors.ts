const colors = {
  dark: "#121212",
  primary: "#a6bf9e",
  primary2: "#91B087",
  tertiary: "#aaaaaa",
  card: "#282828",
  text: "#FFFFFF",
};

export function colored(text: string, color: keyof typeof colors) {
  return `<span style="color: ${colors[color]}; font-weight: bold;">${text}</span>`;
}

export function highlight(text: string) {
  return `<span style="font-weight: bold;">${text}</span>`;
}

export function strong(text: string) {
  return `<span style="color: ${colors.primary2};">${text}</span>`;
}
export function weak(text: string) {
  return `<span style="color: ${colors.tertiary};">${text}</span>`;
}

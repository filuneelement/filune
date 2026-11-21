declare module '*.png' {
  const imageUrl: string
  export default imageUrl
}

declare module '*.md?raw' {
  const text: string
  export default text
}

export function shouldUpdateComponent(n1, n2){
  const { props: prevProps } = n1
  const { props: nextProps } = n2
  let shouldUpdate = false
  for (const key in nextProps) {
    if (Object.prototype.hasOwnProperty.call(nextProps, key)) {
      if(prevProps[key] !== nextProps[key]){
        shouldUpdate = true
        break
      }
    }
  }
  return shouldUpdate
}
export const toBase64 = (input: Uint8Array) =>{
  console.log("[toBase64] Before ", input)
  const a =  Buffer.from(input)
                              .toString("base64")
                              .replace(/\//g, "_")
                              .replace(/\+/g, "-")
                              .replace(/=+$/, "");
  console.log("[toBase64] After ", a)    
  return a                        
}

export const fromBase64 = (input: string) =>{
  console.log("[fromBase64] Before ", input)
  const a =  new Uint8Array(
                              Buffer.from(input.replace(/_/g, "/").replace(/-/g, "+"), "base64")
                            );
  console.log("[fromBase64] After ", a)    
  return a   
}
  

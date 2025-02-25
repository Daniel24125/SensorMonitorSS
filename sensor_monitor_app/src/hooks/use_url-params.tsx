import React from "react"

type PromiseWithParam<K extends string, V> = Promise<{ [key in K]: V }>;


export const useUrlParams = <K extends string>(params: PromiseWithParam<K, string>, keyword: K)=>{
    const [param, setParam] = React.useState<null | string>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        const getParam = async () => {
          try {
            const urlParams = await params;
            setParam(urlParams[keyword]);
          } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
          } finally {
            setLoading(false);
          }
        };
        
        getParam();
      }, [params, keyword]); 
      
      return { param, loading, error };
}
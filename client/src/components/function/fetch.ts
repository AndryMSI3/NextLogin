type FetchResult = { error: string } | Record<string, any>; // Typage du résultat ou de l'erreur

function useFetch() {
  const doFetch = async (
    url: string,
    method: string = 'GET',
    bodyDataName: string[] = [],
    bodyDataValue: string[] = []
  ): Promise<FetchResult> => {
    const fetchParameter: RequestInit = {
      method: method, // Default to GET if no method is passed
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    };

    // Si des données sont envoyées dans le corps de la requête et que la méthode permet un corps
    if (method !== 'GET' && method !== 'HEAD' && bodyDataName && bodyDataValue && bodyDataName.length === bodyDataValue.length) {
      const bodyObj: Record<string, string> = {};
      bodyDataName.forEach((name, index) => {
        bodyObj[name] = bodyDataValue[index];
      });
      fetchParameter.body = JSON.stringify(bodyObj); // Convertir en JSON
    }

    try {
      const response = await fetch(url, fetchParameter);
      if (!response.ok) {
        const errorData = await response.json(); // Récupérer la réponse JSON (qui contient le message d'erreur)
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`); // Utiliser le message du serveur si présent
      }
      const data: FetchResult = await response.json();
      return data; // Renvoyer les données
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Erreur fetch:', err.message);
        return { error: err.message }; // Retourner un objet d'erreur
      }
      return { error: "Erreur inconnue" }; // Retourner une erreur générique si l'erreur est d'un autre type
    }
  };

  return [doFetch];
}


export default useFetch;

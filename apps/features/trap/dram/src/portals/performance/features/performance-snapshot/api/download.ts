export function downloadBlob(blob: Blob,fileName:string)
{
	const url=URL.createObjectURL(blob);
	const a=document.createElement("a");
	a.href=url;
	a.download=fileName;
	document.body.appendChild(a);
	a.click();a.remove();
	URL.revokeObjectURL(url)
}
export function getFileName(v:string|null,fallback:string){
	if(!v)return fallback;
	const u=v.match(/filename\*=UTF-8''([^;]+)/i);if(u?.[1])
		return decodeURIComponent(u[1]);
	return v.match(/filename="?([^";]+)"?/i)?.[1]??fallback
}
export async function downloadExport(url:string,fallback:string){
	const r=await fetch(url);if(!r.ok){
		let m="Export failed";
		try{
			m=(await r.json()).detail??m
		}
		catch{}throw new Error(m)}
		downloadBlob(await r.blob(),getFileName(r.headers.get("Content-Disposition"),fallback))
}

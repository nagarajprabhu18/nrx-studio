import type {NextRequest} from "next/server";
const local=new Map<string,{count:number;expires:number}>();
export async function rateLimit(request:NextRequest,scope:string,limit:number,windowSeconds:number){
 const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();const ip=forwarded||request.headers.get("x-real-ip")||"unknown";const key=`nrx:${scope}:${ip}`;
 if(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN){try{const url=process.env.UPSTASH_REDIS_REST_URL;const token=process.env.UPSTASH_REDIS_REST_TOKEN;const response=await fetch(`${url}/pipeline`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify([["INCR",key],["EXPIRE",key,windowSeconds,"NX"]]),cache:"no-store"});if(!response.ok)return false;const result=await response.json();return Number(result?.[0]?.result)<=limit}catch{return false}}
 const now=Date.now();for(const[k,v]of local)if(v.expires<now)local.delete(k);const item=local.get(key);if(!item||item.expires<now){local.set(key,{count:1,expires:now+windowSeconds*1000});return true}if(item.count>=limit)return false;item.count++;return true;
}

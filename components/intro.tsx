"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
export function Intro(){
 const [show,setShow]=useState(false);const reduced=useReducedMotion();
 useEffect(()=>{try{if(sessionStorage.getItem("nrx-intro-seen"))return;sessionStorage.setItem("nrx-intro-seen","1")}catch{}const shouldReduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const showTimer=setTimeout(()=>setShow(true),0);const hideTimer=setTimeout(()=>setShow(false),shouldReduce?150:1500);return()=>{clearTimeout(showTimer);clearTimeout(hideTimer)}},[]);
 if(!show)return null;
 return <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-[#080910]" initial={{opacity:1}} animate={{opacity:[1,1,0]}} transition={{duration:reduced ? 0.15 : 1.5,ease:[.76,0,.24,1],times:[0,.72,1]}} onAnimationComplete={()=>setShow(false)} aria-hidden="true"><div className="text-center"><motion.div initial={{y:14,scale:.86,opacity:0}} animate={{y:0,scale:1,opacity:1}} transition={{duration:.55,ease:[.16,1,.3,1]}}><Image className="mx-auto drop-shadow-[0_0_28px_#a78bfa]" src="/crown.svg" width={68} height={68} alt=""/></motion.div><motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.28,duration:.5}} className="mt-5 font-semibold tracking-[.28em] text-xl">NRX STUDIO</motion.div><motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.55}} className="mt-3 text-[9px] tracking-[.3em] text-[#a78bfa]">DESIGN • DEVELOP • INSPIRE</motion.div></div><motion.div className="absolute inset-y-0 w-[30vw] bg-gradient-to-r from-transparent via-[#a78bfa17] to-transparent" initial={{x:"-120vw"}} animate={{x:"130vw"}} transition={{duration:.65,delay:.7,ease:"easeInOut"}}/></motion.div>
}

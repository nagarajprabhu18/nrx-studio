"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Star } from "lucide-react";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email.").max(160),
  interest: z.string().trim().min(2).max(80),
  message: z.string().trim().min(15, "Please tell us a little more (15 characters minimum). ").max(2000),
  company: z.string().max(0).optional()
});
const reviewSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  message: z.string().trim().min(12, "Add a little more detail (12 characters minimum). ").max(1000),
  website: z.string().max(0).optional()
});
type Enquiry = z.infer<typeof enquirySchema>;
type ReviewInput = z.infer<typeof reviewSchema>;

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Enquiry>({ resolver: zodResolver(enquirySchema), defaultValues: { interest: "Birthday website" } });
  async function submit(values: Enquiry) {
    setLoading(true); setStatus("");
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json();
      setStatus(response.ok ? "Thanks — we’ll get back to you soon." : data.error || "Could not send your message.");
      if (response.ok) reset();
    } catch { setStatus("Connection issue. Please try WhatsApp or email."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={handleSubmit(submit)} className="glow-card rounded-2xl p-6 md:p-8">
    <div className="grid gap-4 sm:grid-cols-2">
      <label><span className="label">Your name</span><input className="input" maxLength={80} {...register("name")} placeholder="What should we call you?"/>{errors.name&&<span className="mt-1 block text-[10px] text-red-300">{errors.name.message}</span>}</label>
      <label><span className="label">Email address</span><input className="input" type="email" maxLength={160} {...register("email")} placeholder="you@example.com"/>{errors.email&&<span className="mt-1 block text-[10px] text-red-300">{errors.email.message}</span>}</label>
    </div>
    <label className="mt-4 block"><span className="label">What are you dreaming up?</span><select className="input" {...register("interest")}><option>Birthday website</option><option>Anniversary website</option><option>Portfolio website</option><option>Business website</option><option>Something else</option></select></label>
    <label className="mt-4 block"><span className="label">A little about your idea</span><textarea className="input min-h-[120px] resize-y" maxLength={2000} {...register("message")} placeholder="The occasion, the feeling, the tiny details…"/>{errors.message&&<span className="mt-1 block text-[10px] text-red-300">{errors.message.message}</span>}</label>
    <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("company")}/>
    <div className="mt-5 flex flex-wrap items-center gap-4"><button disabled={loading} className="btn-primary disabled:opacity-60">{loading?"Sending…":"Send your message"}<Send size={14}/></button>{status&&<span role="status" className="text-xs text-[#b9b5c9]">{status}</span>}</div>
    <div className="mt-4 text-[10px] text-[#737688]">Your details stay private and are only used to reply to your enquiry.</div>
  </form>;
}

export function ReviewForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReviewInput>({ resolver: zodResolver(reviewSchema) });
  async function submit(values: ReviewInput) {
    setLoading(true); setStatus("");
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, rating }) });
      const data = await response.json();
      setStatus(response.ok ? "Thanks for sharing. Your review is awaiting approval." : data.error || "Could not submit your review.");
      if (response.ok) { reset(); setRating(5); }
    } catch { setStatus("Connection issue. Please try again shortly."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={handleSubmit(submit)} className="mt-8 rounded-2xl border border-white/[.08] bg-white/[.02] p-5">
    <div className="flex flex-wrap items-start justify-between gap-5"><div><div className="text-[13px]">Had a website made with us?</div><div className="mt-1 text-[10px] text-[#8d90a1]">We’d love to hear how it felt.</div></div><div aria-label={`Selected ${rating} stars`} className="flex gap-1">{[1,2,3,4,5].map(n=><button type="button" onClick={()=>setRating(n)} key={n} aria-label={`${n} star${n>1?"s":""}`} className={n<=rating?"text-[#f6cf78]":"text-white/20"}><Star fill={n<=rating?"currentColor":"none"} size={19}/></button>)}</div></div>
    <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]"><div><input maxLength={80} {...register("name")} className="input" placeholder="Your name"/>{errors.name&&<span className="mt-1 block text-[10px] text-red-300">{errors.name.message}</span>}</div><div><textarea maxLength={1000} {...register("message")} className="input min-h-11 resize-y" placeholder="Your experience in a few words…"/>{errors.message&&<span className="mt-1 block text-[10px] text-red-300">{errors.message.message}</span>}</div><input tabIndex={-1} autoComplete="off" className="hidden" {...register("website")}/><button disabled={loading} className="btn-quiet self-start">{loading?"Sending…":"Submit review"}</button></div>
    {status&&<div role="status" className="mt-3 text-xs text-[#b9b5c9]">{status}</div>}
  </form>;
}

import { Link } from "react-router-dom"
import { useState } from "react"
import LucideIcon from "@/components/LucideIcon";



interface CopyToClipboardProps {
    text: string;
    to: string;
}

export default function CopyToClipboard({text, to}: CopyToClipboardProps) {
    const [copied, setCopied] = useState(false)
    return (
       <div className="relative flex items-center gap-3">
          <Link to={to} className="underline">
            {text}
          </Link>
          <LucideIcon name="Copy" size={17} className="cursor-pointer" onClick={() => {
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }} />
            <span className={`absolute top-0 right-0 bg-green-600 text-white text-xs px-1 py-0.5 rounded-full ${copied ? "block" : "hidden"}`}>Copied</span>
        </div>
    )
}
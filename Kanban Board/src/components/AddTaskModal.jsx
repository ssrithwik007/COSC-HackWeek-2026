import { useState, useEffect } from "react";

export default function AddTaskModal({
    isOpen,
    onClose,
    onSubmit
}) {

    useEffect(() => {
        function handleKey(e){
            if(e.key==="Escape"){
                onClose();
            }
        }
        window.addEventListener("keydown",handleKey);
        return ()=>window.removeEventListener("keydown",handleKey);
    },[onClose]);

    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    
    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setDescription("");
            setPriority("medium");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={onClose}>

            <div className="bg-bg rounded-2xl p-6 w-[500px]" onClick={(e) => e.stopPropagation()}>

                <h2 className="text-2xl text-text font-semibold mb-2">
                    New Task
                </h2>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label>Title</label>

                        <input
                            value={title}
                            onChange={(e)=>setTitle(e.target.value)}
                            className="border rounded-lg p-2 bg-card-bg"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label>Description</label>

                        <input
                            value={description}
                            onChange={(e)=>setDescription(e.target.value)}
                            className="border rounded-lg p-2 bg-card-bg"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label>Priority</label>
                        
                        <select
                            value={priority}
                            onChange={(e)=>setPriority(e.target.value)}
                            className="border rounded-lg p-2 bg-card-bg"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    
                    <div className="flex flex-row-reverse gap-2 items-center">
                        <button
                            onClick={onClose}
                            className="mt-6 border-2 border-black px-4 py-2 rounded-lg bg-card-bg"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => onSubmit({
                                title, 
                                description,
                                priority
                            })}
                            className="mt-6 border-2 border-card-bg px-4 py-2 rounded-lg bg-black text-white"
                        >
                            Add Task
                        </button>    
                    </div>
                    
                </div>
            </div>

        </div>
    );
}
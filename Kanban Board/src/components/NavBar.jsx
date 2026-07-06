import { Search, Filter, Plus } from "lucide-react";

export default function Navbar({
    search,
    setSearch,
    filter,
    setFilter,
    onAddTask
}) {
    return (
        <nav className="h-20 mb-3 flex items-center justify-between py-6">
            <h1 className="text-5xl font-bold tracking-tight">
                KANBAN BOARD
            </h1>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Filter
                        size={22}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="
                            appearance-none
                            rounded-2xl
                            border-2
                            border-black
                            bg-card-bg
                            py-3
                            pl-10
                            pr-8
                            outline-none
                        "
                    >
                        <option value="all">All</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <div className="relative">
                    <Search
                        size={22}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
                            w-80
                            rounded-2xl
                            border-2
                            border-black
                            bg-card-bg
                            px-4
                            py-3
                            pr-12
                            outline-none
                        "
                    />
                </div>

                <button
                    onClick={onAddTask}
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border-2
                        border-black
                        bg-black
                        px-5
                        py-3
                        text-white
                        transition
                        hover:bg-gray-800
                    "
                >
                    <Plus size={20}/>
                    New Task
                </button>

            </div>

        </nav>
    );
}
import { Menu, X } from "lucide-react";

export const MobileMenuButton = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => (
    <button
        data-testid="menu-button"

        onClick={toggle}
        className="md:hidden inline-flex items-center justify-center p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
    >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
)
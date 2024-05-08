import React from "react";

const DefaultGrid = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="p-8 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid-rows-4 md:grid-rows-6 lg:grid-rows-8 gap-4 lg:gap-8 h-screen max-h-screen">
            {children}
        </div>
    )
}

export default DefaultGrid;
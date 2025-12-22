import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const FollowedStrategyPie = ({ percentage = 65 }) => {
    const data = [
        { name: "Completed", value: percentage },
        { name: "Remaining", value: 100 - percentage },
    ];

    const COLORS = ["var(--buy)", "var(--sell)"];

    return (
        <div className="w-8 h-8 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart >
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={11}
                        outerRadius={16}
                        paddingAngle={0}

                        dataKey="value"
                        strokeWidth={0}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                </PieChart>

            </ResponsiveContainer>

            {/* Icon in the center */}

            {/* Percentage text in the center */}
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer">

            </div>
            {/* <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                <div className="text-center">
                    <span className="text-[0.6rem] font-bold">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div> */}
        </div>
    );
};

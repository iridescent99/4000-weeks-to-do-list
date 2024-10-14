import React, {useEffect, useRef, useState} from 'react';
import Tree from 'react-d3-tree';
import "./taskTree.css";

const treeData = [
    {
        name: 'Root',
        children: [
            {
                name: 'Child 1',
                children: [{ name: 'Grandchild 1' }, { name: 'Grandchild 2' }],
            },
            {
                name: 'Child 2',
            },
        ],
    },
];

const UpsideDownTree = ({ plugin, registry, nodeColor, selectedCategory }: any) => {
    const [data, setData] = useState([])
    const treeRef = useRef(null);

    useEffect(() => {
        if (registry) setData(registry.createGraphData(plugin));
    },[]);

    useEffect(() => {
        if (data && data.length > 0 && selectedCategory && nodeColor && treeRef && treeRef.current) {
            reset();
            const activeTextNode = Array.from(document.getElementsByTagName("text")).filter((element: SVGTextElement) => element.innerHTML === selectedCategory.name)[0];
            activeTextNode.style.fill = nodeColor;
            // @ts-ignore
            console.log(activeTextNode.parentNode.previousSibling);
            // @ts-ignore
            activeTextNode.parentNode.previousSibling.style.fill = nodeColor;
        }

    },[selectedCategory, data])

    const reset = () => {
        Array.from(document.getElementsByTagName("text")).forEach((element: SVGTextElement) => {
            if (element.hasClass("rd3t-label__title")) {
                element.style.fill = "#fff";
                // @ts-ignore
                element.parentNode.previousSibling.style.fill = "#fff";
            }
        });
    }

    return (
        <div className="task-tree" style={{ width: '100%', height: '500px' }}>
            {data && data.length > 0 && <Tree
                data={data}
                orientation="vertical"
                pathFunc="straight" // You can customize the path function if needed
                ref={treeRef}
                translate={{ x: 500, y: 110 }}
                // initialDepth={1} // Adjust the initial depth
                zoomable={true}
                separation={{ siblings: 1, nonSiblings: 2 }}
                nodeSize={{ x: 200, y: 150 }}
            />}
        </div>
    );
};

export default UpsideDownTree;
import React, { useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {fakeContainers} from "./FakeData";
import Immutable from "immutable";

const {
    // columns,
    data: rows
} = fakeContainers();

function VirtualTable() {
    const [containers, setContainers] = useState(Immutable.fromJS(rows));

    const parentRef = React.useRef()

    const rowVirtualizer = useVirtualizer({
        count: containers.size,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 20,
        overscan: 5,
    });

    const headers = Object.keys(containers.get(0).toJS());
    function renderTable() {
        return (
            <table
                ref={parentRef}
                style={{
                    height: `300px`,
                    width: `650px`,
                    overflow: 'auto',
                }}
            >
                <thead>
                <tr>
                    {
                        headers
                            .map(header => (
                                <th key={header}>{header}</th>
                            ))
                    }
                </tr>
                </thead>
                <tbody
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                {
                    rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const container = containers.get(virtualRow.index);
                        return (
                            <tr
                                key={virtualRow.index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {
                                    headers.map((header) => (
                                        <td key={header}>
                                            <input
                                                name={`${container.get('id')}-${container.get(header)}`}
                                                value={container.get(header)}
                                                onChange={e => {
                                                    setContainers(containers.setIn([virtualRow.index, header], e.target.value))
                                                }}
                                            />
                                        </td>
                                    ))
                                }
                            </tr>
                        );
                    })
                }
                </tbody>
            </table>
        );
    }

    if (!containers) {
        return renderTable();
    }

    return (
        <div
            ref={parentRef}
            style={{
                height: `200px`,
                width: `400px`,
                overflow: 'auto',
            }}
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                        key={virtualRow.index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        Name {containers.getIn([virtualRow.index, 'name'])}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VirtualTable;

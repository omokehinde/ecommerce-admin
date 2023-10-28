import { useEffect, useState } from 'react';
import axios from 'axios';

import Layout from '@/components/Layout';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    useEffect(() => {
        axios.get("/api/orders").then(response=>{
            setOrders(response.data);
        });
    }, [orders]);
    return (
        <Layout>
            <h1>Orders</h1>
            <table className="basic">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Paid</th>
                        <th>Customer</th>
                        <th>Product</th>
                    </tr>
                </thead>
                <tbody>
                    {setOrders.length > 0 && orders.map(order=>(
                        <tr>
                            <td>
                                {(new Date(order.createdAt)).toLocaleString()}
                            </td>
                            <td className={order.paid ? 
                                "text-green-600" : "text-red-600"}>
                                {order.paid ? "YES": "NO"}
                            </td>
                            <td>
                                {order.name} {order.email} <br />
                                {order.city} {order.postalCode} {order.country} <br />
                                {order.streetAddress}
                            </td>
                            <td>
                                {order.line_items.map(l=>(
                                    <>
                                        {l.price_data.product_data.name} X {l.quantity}
                                        <br />
                                    </>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
}
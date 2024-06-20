import { Product } from "@/models/Product";
import Image from "next/image";


export const ProductCard = ({ product }: { product: Product}) => {
    return (
        <div className="flex border rounded-md shadow-md p-2 my-4 animate-fadeIn">
            { product.imageUrl && <img src={product.imageUrl} alt={product.title}/> }
            <div className="pl-4">
                <p>{product.title}</p>
                <p>{product.description}</p>
                <a href={product.url}>{product.url}</a>
            </div>
        </div>
    )
}
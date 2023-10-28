import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/router';
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";


export default function ProductForm({
    _id,
    title: existingTitle, 
    description: existingDescription, 
    price: existingPrice,
    images: existingImages,
    category: assignedCategory,
    properties: assignedProperties
}) {
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [price, setPrice] = useState(existingPrice || 0);
    const [category, setCategory] = useState(assignedCategory || '');
    const [productProperties, setProductProperties] = useState(assignedProperties ||{});
    const [images, setImages] = useState(existingImages || []);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();
    useEffect(() => {
        axios.get('/api/categories/').then(result=>{
            setCategories(result.data);
        });
    }, [])
    
    async function saveProduct(e) {
        e.preventDefault();
        const data = {title, description, price, 
            images, category, properties:productProperties};
        if (_id) {
            //update product
            await axios.put("/api/products", {...data,_id})
        } else {
            // create a product
            await axios.post("/api/products", data);
        }
        console.log(data);
        setGoToProducts(true);
    }
    if (goToProducts) {
         router.push('/products');
    }
    async function uploadImages(e) {
        const files = e.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file',file);
            }
            const res = await axios.post("/api/upload", data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links]
            });
           setIsUploading(false);
        }
    }
    function updateImagesOrder(images) {
        setImages(images);
    }
    const propertiesToFill = [];
    if (categories.length > 0 && category) {
        let categoryInfo = categories.find(({_id}) => _id===category);
        propertiesToFill.push(...categoryInfo.properties);
        while (categoryInfo?.parent?._id) {
            const parentCat = categories.find(({_id}) => _id===categoryInfo.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            categoryInfo = parentCat;
        }
    }
    function setProductProp(propertyName, value) {
        setProductProperties(prev=>{
            const newProductProperties = {...prev};
            newProductProperties[propertyName] = value;
            return newProductProperties;
        });
    }
    return (
        <form onSubmit={saveProduct}>
            <label>Product name</label>
            <input type="text" placeholder="Product name" value={title} 
                onChange={e => setTitle(e.target.value)} />
            <label>Category</label>
            <select value={category}
                onChange={ev=>setCategory(ev.target.value)}>
                <option value=''>Uncategorized</option>
                {categories.length > 0 && categories.map(c=>(
                    <option value={c._id}>{c.name}</option>
                ))}
            </select>
            {propertiesToFill.length > 0 && propertiesToFill.map(p=>(
                <div className="">
                    <label>{p.name[0].toUpperCase()+p.name.substring(1)}</label>
                    <div>
                    <select value={productProperties[p.name]}
                        onChange={ev=>setProductProp(p.name,ev.target.value)}>
                        {p.values.map(v=>(
                            <option value={v}>{v}</option>
                        ))}
                    </select>
                    </div>
                </div>
            ))}
            <label>
                Photos
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
                <ReactSortable 
                    className="flex flex-wrap gap-1" direction={'horizontal'}
                    list={images} setList={updateImagesOrder} >
                    {!!images?.length && images.map(link => (
                        <div key={link} className="h-24 bg-white p-4 shadow-sm
                            rounded-sm border border-gray-200">
                            <img src={link} alt="" className="rounded-lg" />
                        </div>
                    ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 p-1 flex items-center rounded-lg">
                        <Spinner />
                    </div>
                )}
                <label className="w-24 h-24 text-center flex items-center justify-center
                    flex-col text-sm text-primary rounded-lg bg-white shadow-sm 
                    cursor-pointer border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                        viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25
                         0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>Upload</div> 
                    <input type="file" onChange={uploadImages} className="hidden" />
                </label>
            </div>
            <label>Description</label>
            <textarea placeholder="Description" value={description} 
                onChange={e => setDescription(e.target.value)}></textarea>
            <label>Price</label>
            <input type="number" placeholder="Price" value={price} 
                onChange={e => setPrice(e.target.value)}/>
            <button type="submit" className="btn-primary">Save</button>
        </form>
    );
}
import { useState, useEffect } from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';

import Layout from "@/components/Layout";

function Categories({swal}) {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [properties, setProperties] = useState([]);
    useEffect(() => {
      fetchCategories();
    }, []);

    function fetchCategories() {
        axios.get('/api/categories').then(result=>{
            setCategories(result.data);
          });
    }
    
    async function saveCategory(e) {
        e.preventDefault();
        const data = {name, parentCategory, properties:properties.map(p=>({
            name: p.name, values: p.values.split(",")
        }))};
        if (editedCategory) {
            await axios.put('/api/categories', {...data, _id:editedCategory._id});
            setEditedCategory(null);
        } else {
            await axios.post('/api/categories', data);
        }
        setName('');
        setParentCategory('');
        setProperties([]);
        fetchCategories();
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(category.properties.map(
            ({name,values})=>({name,values:values.join(',')})));
    }
    function deleteCategory(category) {
        swal.fire({
            title: 'Are you sure?',
            text: `Are you sure want to delete ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#d55',
            reverseButtons: true
        }).then(async result => {
            if (result.isConfirmed) {
                await axios.delete('/api/categories/?id='+category._id);
                fetchCategories();
            }
        });
    }
    function addProperty() {
        setProperties(prev => {
            return [...prev, {name:'',values:''}]
        });
    }
    function handlePropertyNameChange(index,property,newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties
        });
        // console.log(property);
    }
    function handlePropertyValuesChange(index,property,newValues) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties
        });
        // console.log(property);
    }
    function removeProperty(indexToRemove) {
        setProperties(prev=>{
            return [...prev].filter((p,pIndex)=>{
                return pIndex!==indexToRemove;
            });
        });
    }
    return (
        <Layout>
            <h1>Categories</h1>
            <label>{editedCategory ? 
            `Edit category ${editedCategory.name}` : 'Create new category'}</label>
            <form onSubmit={saveCategory} >
                <div className="flex gap-1">
                    <input 
                        required
                        type="text" value={name} placeholder="Category name" 
                        onChange={ev=>setName(ev.target.value)}
                    />
                    <select 
                        onChange={ev=>setParentCategory(ev.target.value)}
                        value={parentCategory}>
                        <option value=''>No parent category</option>
                        { categories.length > 0 && categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button type="button" 
                        onClick={addProperty}
                        className="btn-default text-sm mb-2">
                        Add new property
                    </button>
                    {properties.length > 0 && properties.map((property, index)=>(
                        <div className="flex gap-1 mb-2">
                            <input type="text" value={property.name} 
                                className="mb-0"
                                onChange={ev => 
                                    handlePropertyNameChange(index, 
                                        property, ev.target.value)}
                                placeholder="property name (example color)" />
                            <input type="text" 
                                className="mb-0"
                                value={property.values} 
                                onChange={ev =>
                                    handlePropertyValuesChange(index, 
                                        property, ev.target.value)}
                                placeholder="values, comma seperated" />
                            <button type="button" className="btn-red"
                                onClick={()=>removeProperty(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">              
                    {editedCategory && (
                    <button type="button" className="btn-default"
                        onClick={()=>{
                            setEditedCategory(null);
                            setName('');
                            setParentCategory('');
                            setProperties([]);
                        }}>
                        Cancel
                    </button>
                    )}
                    <button type="submit" className="btn-primary py-1">Save</button>
                </div>
            </form>
            {!editedCategory && (
            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Category name</td>
                        <td>Parent category</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    { categories.length > 0 && categories.map(category => (
                        <tr key={category._id}>
                            <td>{category.name}</td>
                            <td>{category.parent?.name}</td>
                            <td>
                                <button className="btn-default mr-1"
                                    onClick={() => editCategory(category)}
                                    >Edit</button>
                                <button className="btn-red"
                                    onClick={()=>deleteCategory(category)}
                                    >Delete</button>
                            </td>
                        </tr>
                    )) }
                </tbody>
            </table>
            )}
        </Layout>
    );
}

export default withSwal(({swal}, ref) => (
    <Categories swal={swal} />
));
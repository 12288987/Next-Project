import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY = 
    defineQuery(`*[_type=="startup" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    author -> {
      _id,name,image,bio
    },
    slug,
    title,
    views,
    image,
    category,
    description
    ,_createdAt
  }`)
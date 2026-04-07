import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query AllCategories($first: Int!) {
    categories(first: $first) {
      nodes {
        id
        name
        slug
        description
        count
      }
    }
  }
`;

// export const GET_ALL_POSTS = gql`
//   query AllPosts($first: Int!, $search: String) {
//     posts(first: $first, where: { search: $search }) {
//       nodes {
//         id
//         title
//         slug
//         excerpt
//         date
//         modified
//         featuredImage {
//           node {
//             sourceUrl
//             altText
//           }
//         }
//         categories {
//           nodes {
//             name
//             slug
//           }
//         }
//       }
//     }
//   }
// `;

export const GET_ALL_POSTS = gql`
  query AllPosts($first: Int!, $search: String) {
    posts(first: $first, where: { search: $search, stati: [PUBLISH] }) {
      nodes {
        id
        title
        slug
        excerpt
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export const categoryId = gql`
  query GetBlogCategoryId {
    categories(where: { slug: "blog" }) {
      nodes {
        databaseId
        name
        slug
      }
    }
  }
`;

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      excerpt
      date
      modified
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      seo {
        title
        metaDesc
        canonical
      }
    }
  }
`;

export const GET_ALL_POSTS_OF_BLOG = gql`
  query AllPosts($first: Int!, $search: String) {
    posts(first: $first, where: { search: $search }) {
      nodes {
        id
        title
        slug
        excerpt
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

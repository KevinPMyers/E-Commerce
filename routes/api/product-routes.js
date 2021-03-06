const router = require('express').Router();
const { response } = require('express');
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  Product.findAll({
    attributes: ['id', 'product_name', 'price', 'stock']
  })
  .then(response => res.json(response))
  .catch(err => {
    console.log(err);
    res.status(400).json(err);
  })
  // find all products
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', (req, res) => {
  Product.findOne({
    where: {
      id: req.params.id
    },
    include: [{ all: true, nested: true}
  ]
  }).then(response => {
    if (!response) {
      res.status(404).json({ message: 'No Product found with this ID' });
      return;
    }
    res.json(response);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.category_id.length) {
        const productTagIdArr = req.body.category_id.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    // .then((product) => {
    //   // find all associated tags from ProductTag
    //   return ProductTag.findAll({ where: { product_id: req.params.id } });
    // })
    // .then((productTags) => {
    //   // get list of current tag_ids
    //   const productTagIds = productTags.map(({ tag_id }) => tag_id);
    //   // create filtered list of new tag_ids
    //   const newProductTags = req.body.category_id
    //     .filter((category_id) => !productTagIds.includes(category_id))
    //     .map((tag_id) => {
    //       return {
    //         product_id: req.params.id,
    //         tag_id,
    //       };
    //     });
    //   // figure out which ones to remove
    //   const productTagsToRemove = productTags
    //     .filter(({ category_id }) => !req.body.category_id.includes(category_id))
    //     .map(({ id }) => id);

    //   // run both actions
    //   return Promise.all([
    //     ProductTag.destroy({ where: { id: productTagsToRemove } }),
    //     ProductTag.bulkCreate(newProductTags),
    //   ]);
    // })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(response => {
    if (!response) {
      res.status(404).json({ message: 'No Product found with this ID'});
      return;
    }
    res.json(response);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;

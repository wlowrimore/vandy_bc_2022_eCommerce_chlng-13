const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// get all products
router.get('/', (_req, res) => {
  Product.findAll({
    include: [
      {
        model: Category, 
        model: Tag,
      },
    ]
  })
    .then(dbProductData => res.json(dbProductData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// get one product
router.get('/:id', (req, res) => {
  Product.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
    include: [
      {
        model: Category,
        attributes: ['id', 'category_name']
      },
      {
        model: Tag,
        attributes: ['id', 'tag_name']
      }
    ]
  })
  .then(dbProductData => {
    if (!dbProductData) {
      res.status(404).json({ message: 'No Product Found By This Id'});
      return;
    }
    res.json(dbProductData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// create new product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // look for product tags and include in bulk create
      if (req.body.tagIds) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
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
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
  .then((_product) => {
    // find all related tags from ProductTag
    return ProductTag.findAll({ where: { product_id: req.params.id } });
  })
  .then((productTags) => {
    const productTagIds = productTags.map(({ tag_id }) => tag_id)

    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
    const productTagsToRemove = productTags
      .filter(( tag_id ) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    return Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);
  })
  .then((updatedProductTags) => res.json(updatedProductTags))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

// delete single product
router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(dbProductData => {
    if (!dbProductData) {
      res.status(404).json({ message: 'No Product Found By This Id'});
      return;
    }
    res.json(dbProductData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err)
  });
});

module.exports = router;

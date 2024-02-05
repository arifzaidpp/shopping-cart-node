function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)
            }
        }
    })
}

function changeQuantity(cartId, proId, count, userId) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    let cartCount = $('#cart-count').html()
    count = parseInt(count)
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product Removed from cart")
                location.reload()
            } else {
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('total').innerHTML = response.total[0].total
                document.getElementsByClassName('total').innerHTML = response.total
                cartCount = parseInt(cartCount) + 1
                $("#cart-count").html(cartCount)
            }
        }
    })
}


$("#checkout-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url: '/place-order',
        method: 'post',
        data:$('#checkout-form').serialize(),
        success: (response)=>{
        alert(response)
        if (response.status) {
            location.href='/order-success'
        }
        }
    })
})
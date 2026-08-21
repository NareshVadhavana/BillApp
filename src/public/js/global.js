// Ensure the JS runs after the page fully loads
$(document).ready(function () {
  // --- Close invoice preview modal ---
  $(document).on('click', '#closePreview', function () {
    $('#invoicePreviewOverlay').fadeOut(200);
  });

  // Close preview on ESC key
  $(document).keyup(function (e) {
    if (e.key === 'Escape') {
      $('#invoicePreviewOverlay').fadeOut(200);
    }
  });

  // --- Function to open preview from any page ---
  window.openInvoicePreview = function (invoiceHtml) {
    $('#invoicePreviewContent').html(invoiceHtml);
    $('#invoicePreviewOverlay').fadeIn(200);
    $('html, body').animate({ scrollTop: 0 }, 300);
  };

  // --- Optional: attach to preview button automatically if exists ---
  $(document).on('click', '#previewInvoice', function () {
    // Collect invoice data from form
    const invoice = {
      invoiceNumber: $('input[name="invoiceNumber"]').val(),
      invoiceIssueDate: $('input[name="invoiceIssueDate"]').val(),
      customerName: $('#customerName').val(),
      customerAddress: $('#customerAddress').val(),
      customerPhoneNumber: $('#customerPhone').val(),
      items: [],
      subTotal: parseFloat($('#subTotal').val()) || 0,
      totalTax: parseFloat($('#totalTax').val()) || 0,
      discount: parseFloat($('#discount').val()) || 0,
      grandTotal: parseFloat($('#grandTotal').val()) || 0,
      companyId: {
        companyName: 'A to Z Mobile',
        companyAddress: 'Uji Nivas, Kumudwadi, Bhavnagar',
        companyPhoneNumber: '9277202198',
        gstNumber: '24CSBPD1787J2ZQ',
      },
    };

    // Collect items
    $('#itemsBody .item-row').each(function () {
      invoice.items.push({
        itemName: $(this).find('input[name*="[itemName]"]').val(),
        quantity: parseFloat($(this).find('.qty').val()) || 0,
        unitPrice: parseFloat($(this).find('.price').val()) || 0,
      });
    });

    // Render preview using server partial template
    $.ajax({
      url: '/invoices/render-invoice-template',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ invoice: invoice }),
      success: function (html) {
        openInvoicePreview(html);
      },
      error: function (err) {
        console.error(err);
        alert('Failed to render invoice preview.');
      },
    });
  });
});

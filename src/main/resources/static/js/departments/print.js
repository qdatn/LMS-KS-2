function printPage() {
    window.print();
}

function exitPage() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.close();
    }
}
export class ReviewVue {
    constructor() {
        this.panel = document.getElementById("reviewPanel");
        this.list = document.getElementById("reviewList");
        this.form = document.getElementById("reviewForm");
        this.title = document.getElementById("reviewTitle");
    }

    show(title) {
        this.title.textContent = title;
        this.panel.style.display = "block";
    }

    render(reviews) {
        this.list.innerHTML = "";

        reviews.forEach(r => {
            const div = document.createElement("div");
            div.innerHTML = `
        <strong>${r.fields.Name}</strong> – ⭐ ${r.fields.value}
        <p>${r.fields.comment ?? ""}</p>
      `;
            this.list.appendChild(div);
        });
    }

    bindSubmit(handler) {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();

            const data = {
                user: this.form.user.value,
                value: Number(this.form.value.value),
                comment: this.form.comment.value
            };

            handler(data);
            this.form.reset();
        });
    }
}
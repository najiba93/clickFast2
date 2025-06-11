const sum = (a, b) => a + b;

test("Addition de 2 et 3 doit donner 5", () => {
    expect(sum(2, 3)).toBe(5);
});

import SwiftUI

struct AddItemSheet: View {
    let title: String
    let onSave: (GroceryItemDraft) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var draft: GroceryItemDraft
    @FocusState private var nameFieldFocused: Bool

    init(title: String, draft: GroceryItemDraft, onSave: @escaping (GroceryItemDraft) -> Void) {
        self.title = title
        self.onSave = onSave
        self._draft = State(initialValue: draft)
    }

    private var canSave: Bool {
        !draft.name.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    fieldSection("NAME") {
                        TextField("Item name", text: $draft.name)
                            .focused($nameFieldFocused)
                            .submitLabel(.done)
                            .onSubmit { if canSave { save() } }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background(Color(.systemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }

                    fieldSection("QUANTITY") {
                        TextField("Optional", text: $draft.quantity)
                            .keyboardType(.decimalPad)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background(Color(.systemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .frame(width: 120, alignment: .leading)
                    }

                    fieldSection("UNIT") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(GroceryUnit.allCases) { unit in
                                    PillButton(label: unit.label, isSelected: draft.unit == unit) {
                                        draft.unit = unit
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }

                    fieldSection("CATEGORY") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(GroceryCategory.orderedCases) { cat in
                                    PillButton(label: cat.label, isSelected: draft.category == cat) {
                                        draft.category = cat
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 40)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(!canSave)
                }
            }
        }
        .onAppear { nameFieldFocused = true }
    }

    private func save() {
        onSave(draft)
        dismiss()
    }

    @ViewBuilder
    private func fieldSection<Content: View>(
        _ label: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.secondary)
                .kerning(0.5)
            content()
        }
    }
}

// MARK: - PillButton

struct PillButton: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? Color.accentColor : Color(.systemBackground))
                .foregroundColor(isSelected ? .white : .primary)
                .clipShape(Capsule())
                .overlay(
                    Capsule().stroke(
                        isSelected ? Color.accentColor : Color(.systemGray4),
                        lineWidth: 1
                    )
                )
        }
        .buttonStyle(.plain)
    }
}

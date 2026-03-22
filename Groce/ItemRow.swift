import SwiftUI

struct ItemRow: View {
    let item: GroceryItem
    let showCheckbox: Bool
    let onToggle: (() -> Void)?

    var body: some View {
        HStack(spacing: 14) {
            if showCheckbox {
                Button(action: { onToggle?() }) {
                    ZStack {
                        Circle()
                            .strokeBorder(
                                item.checked ? Color.accentColor : Color(.systemGray4),
                                lineWidth: 2
                            )
                            .background(
                                Circle().fill(item.checked ? Color.accentColor : Color.clear)
                            )
                            .frame(width: 24, height: 24)
                        if item.checked {
                            Image(systemName: "checkmark")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                }
                .buttonStyle(.plain)
            }

            HStack {
                Text(item.name)
                    .strikethrough(item.checked, color: .secondary)
                    .foregroundColor(item.checked ? .secondary : .primary)
                    .lineLimit(1)

                Spacer()

                if let qty = item.qtyLabel {
                    Text(qty)
                        .font(.subheadline)
                        .foregroundColor(item.checked ? Color(.systemGray4) : .secondary)
                }
            }
        }
        .padding(.vertical, 2)
    }
}

import enum


class UserRole(str, enum.Enum):
    cliente = "cliente"
    dono_restaurante = "dono_restaurante"
    entregador = "entregador"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    recebido = "recebido"
    em_preparo = "em_preparo"
    pronto = "pronto"
    saiu_entrega = "saiu_entrega"
    entregue = "entregue"
    cancelado = "cancelado"


class DeliveryStatus(str, enum.Enum):
    aguardando_retirada = "aguardando_retirada"
    retirado = "retirado"
    em_rota = "em_rota"
    entregue = "entregue"


class PaymentStatus(str, enum.Enum):
    pendente = "pendente"
    pago = "pago"
    falhou = "falhou"
